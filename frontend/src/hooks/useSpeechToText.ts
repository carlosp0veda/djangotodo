import { useState, useEffect, useRef } from 'react';
import { WindowWithSpeech, ISpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '@/types';

interface UseSpeechToTextProps {
    onTranscript: (transcript: string) => void;
    lang?: string;
}

export function useSpeechToText({ onTranscript, lang = 'en-US' }: UseSpeechToTextProps) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<ISpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition = (window as unknown as WindowWithSpeech).SpeechRecognition ||
            (window as unknown as WindowWithSpeech).webkitSpeechRecognition;

        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = lang;

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    onTranscript(finalTranscript);
                }
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [lang, onTranscript]);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Speech Recognition is not supported in this browser.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error('Failed to start recognition', error);
                setIsListening(false);
            }
        }
    };

    return {
        isListening,
        toggleListening,
        isSupported: !!((window as unknown as WindowWithSpeech).SpeechRecognition ||
            (window as unknown as WindowWithSpeech).webkitSpeechRecognition)
    };
}
