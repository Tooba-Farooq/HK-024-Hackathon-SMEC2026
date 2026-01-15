"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function QRScanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanRegionRef = useRef<HTMLDivElement>(null);

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  const startScanning = async () => {
    try {
      setError(null);
      setSuccess(null);
      setScanning(true);

      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      }

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      const facingMode = isMobile() ? "environment" : "user";
      
      await scanner.start(
        { facingMode },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors
        }
      );
    } catch (err: unknown) {
      console.error("Error starting scanner:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setScanning(false);
      if (scannerRef.current) {
        scannerRef.current = null;
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const extractUserId = (scannedText: string): string | null => {
    try {
      const trimmed = scannedText.trim();
      console.log("Extracting from:", trimmed);
      
      // Check if it looks like base64 (starts with common base64 patterns)
      if (trimmed.startsWith('eyJ') || /^[A-Za-z0-9+/=]+$/.test(trimmed)) {
        try {
          // Try base64 decode
          const decoded = atob(trimmed);
          console.log("Base64 decoded:", decoded);
          const parsed = JSON.parse(decoded);
          console.log("Parsed JSON:", parsed);
          if (parsed && parsed.userId) {
            return parsed.userId;
          }
        } catch (e) {
          console.log("Base64 decode failed:", e);
          // Base64 decode failed, continue to other checks
        }
      }
      
      // Try direct JSON parse (in case it's already decoded JSON)
      try {
        const parsed = JSON.parse(trimmed);
        console.log("Direct JSON parsed:", parsed);
        if (parsed && parsed.userId) {
          return parsed.userId;
        }
      } catch {
        // Not JSON, continue
      }
      
      // If it's not JSON, treat it as plain user ID
      console.log("Treating as plain user ID");
      return trimmed;
    } catch (err) {
      console.error("Error extracting user ID:", err);
      // If all parsing fails, treat the whole string as user ID
      return scannedText.trim();
    }
  };

  const handleScanSuccess = async (scannedText: string) => {
    console.log("Scanned text:", scannedText);
    const userId = extractUserId(scannedText);
    console.log("Extracted user ID:", userId);
    
    if (!userId) {
      setError("Invalid QR code format");
      return;
    }

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        let errorMessage = `Failed to connect: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error("API error:", errorData);
        } catch {
          const text = await response.text();
          console.error("Response text:", text);
          errorMessage = text || errorMessage;
        }
        setError(errorMessage);
        return;
      }

      const data = await response.json();
      setSuccess(`Connected with ${data.connectedUser?.name || "user"}!`);
      await stopScanning();
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("Error in handleScanSuccess:", err);
      setError(err instanceof Error ? err.message : "Failed to process connection");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setSuccess(null);

      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch {}
        scannerRef.current = null;
      }

      const scanner = new Html5Qrcode("qr-reader");
      const decodedText = await scanner.scanFile(file, true);
      scanner.clear();
      await handleScanSuccess(decodedText);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to scan QR code from image");
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        stopScanning();
      }, 0);
    }
    return () => {
      stopScanning();
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Scan QR Code</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div id="qr-reader" className="w-full min-h-[300px]" ref={scanRegionRef}></div>
          
          {!scanning && (
            <div className="space-y-2">
              <Button onClick={startScanning} className="w-full">
                Start Camera
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="qr-file-input"
                />
                <Button variant="outline" className="w-full" asChild>
                  <label htmlFor="qr-file-input" className="cursor-pointer">
                    Upload QR Image
                  </label>
                </Button>
              </div>
            </div>
          )}

          {scanning && (
            <Button onClick={stopScanning} variant="destructive" className="w-full">
              Stop Scanning
            </Button>
          )}

          {error && (
            <Card className="p-3 bg-destructive/10 border-destructive">
              <p className="text-sm text-destructive">{error}</p>
            </Card>
          )}

          {success && (
            <Card className="p-3 bg-green-500/10 border-green-500">
              <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
