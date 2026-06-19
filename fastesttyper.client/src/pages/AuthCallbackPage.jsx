import { useEffect } from "react";

export default function AuthCallbackPage({ onAuthSuccess }) {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const userId = params.get("userId");
        const name = params.get("name");
        const email = params.get("email");

        if (userId && name && email) {
            onAuthSuccess({ id: parseInt(userId), name, email });
        } else {
            // If no params, redirect to home
            window.location.href = "/";
        }
    }, [onAuthSuccess]);

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh"
        }}>
            <p>Logging you in...</p>
        </div>
    );
}