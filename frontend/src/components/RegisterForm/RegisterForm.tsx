"use client";

import { useState } from "react";
import Image from "next/image";
import { RegisterFormProps } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button/Button";
import styles from "./RegisterForm.module.css";

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { register, isLoading, error: authError } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        register({ email, password });
    };

    const error = authError ? (authError as Error).message : null;

    return (
        <div className={styles.wrapper}>
            <div className={styles.inner}>
                <Image
                    src="/assets/cat.png"
                    alt="Cute Cat"
                    width={160}
                    height={160}
                    className={styles.image}
                    priority
                />

                <h1 className={styles.title}>
                    Yay, New Friend!
                </h1>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.errorBox}>
                            {error}
                        </div>
                    )}

                    <div className={styles.inputWrap}>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.input}
                            placeholder="Email address"
                        />
                    </div>

                    <div className={styles.inputWrap}>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={styles.input}
                            placeholder="Password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={styles.eyeButton}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <svg className={styles.eyeIcon} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                    <line x1="2" y1="2" x2="22" y2="22" />
                                </svg>
                            ) : (
                                <svg className={styles.eyeIcon} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        fluid
                    >
                        {isLoading ? "Wait for it..." : "Sign Up"}
                    </Button>

                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className={styles.switchBtn}
                    >
                        We&apos;re already friends!
                    </button>
                </form>
            </div>
        </div>
    );
}
