import { useEffect } from "react";

export default function AuthCallbackPage({ onAuthSuccess }) {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const userId = params.get("userId");
        const name = params.get("name");
        const email = params.get("email");

        if (userId && name && email) {
            onAuthSuccess({
                id: userId,
                name: decodeURIComponent(name),
                email: decodeURIComponent(email),
                entries: [],
            });
        }
    }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "4rem" }}>
            <p>Signing you in…</p>
        </div>
    );
}