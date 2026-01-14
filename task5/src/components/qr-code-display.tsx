"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export function QRCodeDisplay() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/qr")
      .then((res) => res.json())
      .then((data) => {
        if (data.qrCode) {
          setQrCode(data.qrCode);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="p-6 w-full max-w-sm">
        <div className="flex items-center justify-center h-64">
          <p>Loading QR code...</p>
        </div>
      </Card>
    );
  }

  if (!qrCode) {
    return (
      <Card className="p-6 w-full max-w-sm">
        <div className="flex items-center justify-center h-64">
          <p>Failed to load QR code</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 w-full max-w-sm">
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-lg font-semibold">Your QR Code</h3>
        <img src={qrCode} alt="QR Code" className="w-64 h-64" />
        <p className="text-sm text-muted-foreground text-center">
          Share this QR code to let others connect with you
        </p>
      </div>
    </Card>
  );
}
