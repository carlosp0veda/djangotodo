import React from "react";
import Image from "next/image";
import styles from "./EmptyState.module.css";

export default function EmptyState() {
    return (
        <div className={styles.wrapper}>
            <Image
                src="/assets/cup.png"
                alt="Boba Tea"
                width={256}
                height={256}
                className={styles.image}
            />
            <p className={styles.message}>
                I&apos;m just here waiting for your charming notes...
            </p>
        </div>
    );
}
