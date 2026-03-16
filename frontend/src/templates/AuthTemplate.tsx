"use client";

import { useState } from "react";
import LoginForm from "@/components/LoginForm/LoginForm";
import RegisterForm from "@/components/RegisterForm/RegisterForm";

export default function HomeTemplate() {
    const [isRegistering, setIsRegistering] = useState(false);

    if (isRegistering) {
        return <RegisterForm onSwitchToLogin={() => setIsRegistering(false)} />;
    }

    return <LoginForm onSwitchToRegister={() => setIsRegistering(true)} />;
}
