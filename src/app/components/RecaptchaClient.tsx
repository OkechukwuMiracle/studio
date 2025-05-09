"use client";

import { useEffect, useRef, useState } from "react";
import { RecaptchaVerifier, Auth } from "firebase/auth";

interface RecaptchaClientProps {
  setRecaptchaVerifier: (verifier: RecaptchaVerifier | null) => void;
  auth: Auth;
}

export default function RecaptchaClient({
  setRecaptchaVerifier,
  auth
}: RecaptchaClientProps) {
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState<boolean>(false);

  // Function to create the verifier
  const createVerifier = () => {
    if (recaptchaContainerRef.current) {
      const verifier = new RecaptchaVerifier(
        auth,
        recaptchaContainerRef.current,
        {
          size: "invisible",
        }
      );
      setRecaptchaVerifier(verifier);
    }
  }

  useEffect(() => {
    // Check if firebase is loaded
    if (auth) {
      setIsFirebaseLoaded(true);
    }
  }, [auth]);

  useEffect(() => {
    if (isFirebaseLoaded) {
        createVerifier();
    }
        return () => {
          setRecaptchaVerifier(null);
        }
  }, [isFirebaseLoaded]);

  return <div id="recaptcha-container" ref={recaptchaContainerRef} />;
}