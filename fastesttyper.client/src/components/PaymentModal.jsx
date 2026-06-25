import { useState, useEffect, useRef } from "react";
import "./PaymentModal.css";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function PaymentModal({ onSuccess, onClose, user }) {
    const [step, setStep] = useState("confirm"); // confirm | processing | done
    const [entryId] = useState(() => `entry_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
    const initializedRef = useRef(false);
    const [createdEntry, setCreatedEntry] = useState(null); // real DB entry, once created

    // ── Load PayPal SDK script ───────────────────────────────
    useEffect(() => {
        if (initializedRef.current) return; // guards against StrictMode double-invoke in dev
        initializedRef.current = true;

        if (window.paypal) {
            renderPayPalButton();
            return;
        }

        const script = document.createElement("script");
        // Use the original script URL without disable-fastlane param
        script.src = "https://www.paypal.com/sdk/js?client-id=AUdrmWSBQl1fjiTAZM5X8akET98ivKOQiEtVcHHvgOl7qTqNgSSR8sHQq1Mk_KHPyMykkIBQqE3sfblE&currency=USD&disable-funding=venmo";
        script.async = true;
        script.onload = () => renderPayPalButton();
        document.body.appendChild(script);

        // No cleanup needed
    }, []);

    const renderPayPalButton = () => {
        if (!window.paypal) return;
        const container = document.getElementById("paypal-button-container");
        if (!container || container.children.length > 0) return;

        const createOrderFn = async () => {
            const res = await fetch(`${API_URL}/api/paypal/create-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ entryId }),
            });
            const data = await res.json();
            return data.id; // PayPal order ID
        };

        const onApproveFn = async (data) => {
            setStep("processing");
            try {
                const res = await fetch(`${API_URL}/api/paypal/capture-order/${data.orderID}`, {
                    method: "POST",
                    credentials: "include",
                });
                const order = await res.json();
                console.log("Captured:", order);

                // Payment is confirmed — now create the REAL entry row in the database.
                const entryRes = await fetch(`${API_URL}/api/entries/create`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        entryId,
                        payPalOrderId: data.orderID,
                    }),
                });

                if (!entryRes.ok) {
                    throw new Error(`Entry creation failed: ${entryRes.status}`);
                }

                const entry = await entryRes.json();
                setCreatedEntry(entry);
                setStep("done");
            } catch (err) {
                console.error("Capture or entry creation failed:", err);
                alert("Payment succeeded but we couldn't set up your entry. Please contact support.");
                setStep("confirm");
            }
        };

        // Card button first (primary) with disableFastlane style
        window.paypal.Buttons({
            fundingSource: window.paypal.FUNDING.CARD,
            createOrder: createOrderFn,
            onApprove: onApproveFn,
            onError: (err) => { console.error("PayPal error:", err); alert("Payment failed. Please try again."); },
            style: {
                disableFastlane: true
            }
        }).render("#paypal-button-container");

        // PayPal button second with disableFastlane style
        window.paypal.Buttons({
            fundingSource: window.paypal.FUNDING.PAYPAL,
            createOrder: createOrderFn,
            onApprove: onApproveFn,
            onError: (err) => { console.error("PayPal error:", err); alert("Payment failed. Please try again."); },
            style: {
                disableFastlane: true
            }
        }).render("#paypal-button-container");
    };

    // Pass the REAL entry (with the database's integer id) up to App.jsx.
    const handleStart = () => {
        if (!createdEntry) return; // shouldn't happen, but guard just in case
        onSuccess(createdEntry);
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal payment-modal">
                <button className="modal-close" onClick={onClose}>×</button>

                {step === "confirm" && (
                    <>
                        <div className="payment-icon">💳</div>
                        <h2>Enter the Competition</h2>
                        <p className="modal-sub">
                            Hi {user?.name?.split(" ")[0]}! One entry costs <strong style={{ color: "#FFD166" }}>$3 XCD</strong>.
                            Complete your payment below to get your typing passage.
                        </p>

                        <div className="payment-summary card">
                            <div className="payment-row">
                                <span>Competition entry</span>
                                <span>$3.00 XCD</span>
                            </div>
                            <div className="payment-row">
                                <span className="text-muted" style={{ fontSize: "0.82rem" }}>PayPal processing fee</span>
                                <span className="text-muted" style={{ fontSize: "0.82rem" }}>~$0.50 XCD</span>
                            </div>
                            <div className="payment-row payment-total">
                                <span>Total</span>
                                <span className="text-gold">~$3.50 XCD</span>
                            </div>
                        </div>

                        <p className="payment-note">
                            Payment is processed securely by PayPal. You can enter multiple times — each entry is independent.
                        </p>

                        {/* PayPal button renders here */}
                        <div id="paypal-button-container" className="paypal-container"></div>

                        <p className="payment-disclaimer">
                            By paying, you agree to the competition rules. No refunds once an entry is started.
                        </p>
                    </>
                )}

                {step === "processing" && (
                    <div className="payment-processing">
                        <div className="spinner"></div>
                        <h2>Confirming payment…</h2>
                        <p className="modal-sub">Just a moment while we lock in your entry.</p>
                    </div>
                )}

                {step === "done" && (
                    <div className="payment-done">
                        <div className="success-icon">✅</div>
                        <h2>You're in!</h2>
                        <p className="modal-sub">
                            Payment confirmed. Your passage is ready whenever you are.
                            Take a breath — then start typing.
                        </p>
                        <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center", marginTop: "8px" }} onClick={handleStart}>
                            Start typing now →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}