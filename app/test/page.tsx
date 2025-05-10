"use client";

import { useEffect, useState } from "react";

export default function TestPage() {
  const [status, setStatus] = useState<{
    success?: boolean;
    message?: string;
    data?: any;
    error?: any;
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/test-connection")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
        setLoading(false);
      })
      .catch((error) => {
        setStatus({ success: false, message: "Error fetching data", error });
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
        
        {loading ? (
          <p className="text-gray-600">Testing database connection...</p>
        ) : status.success ? (
          <div className="space-y-4">
            <div className="bg-green-100 text-green-700 p-4 rounded-md">
              ✅ {status.message}
            </div>
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">User Data:</h2>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
                {JSON.stringify(status.data, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            ❌ {status.message}
            {status.error && (
              <pre className="mt-2 text-sm">
                {JSON.stringify(status.error, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}