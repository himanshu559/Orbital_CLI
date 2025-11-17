"use client";
import TextType from "@/components/TextType"
import { authClient } from "@/lib/auth-client";
import type React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const DeviceAuthorizationPage = () => {
  const [userCode, setUserCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const  handleSubmit = async(e:React.FormEvent)=>{
    e.preventDefault()
    setError(null)
    setIsLoading(true)
  
  try {
  const formattedCode = userCode.trim().replace(/-/g, "").toUpperCase();
  
  const response = await authClient.device({
    query: {user_code: formattedCode}
  });
  
  if (response.data) {
    router.push(`/approve?user_code=${formattedCode}`);
  }
} catch (error) {
  setError("The device code is invalid or has expired.");
}
finally{
  setIsLoading(false);
}
  }


  const handleCodeChange = (e:React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (value.length > 4) {
    value = value.slice(0, 4) + "-" + value.slice(4, 8);
  }
  setUserCode(value);
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="p-3 rounded-lg border-2 border-dashed border-zinc-700">
            <ShieldAlert className="w-8 h-8 text-yellow-300" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2"><TextType 
  text={["Device Authorization"]}
  typingSpeed={75}
  pauseDuration={1500}
  showCursor={true}
  cursorCharacter="🔒"
  variableSpeed={false}
  onSentenceComplete={() => {}}
/></h1>
            <p className="text-muted-foreground">Enter your device code to continue</p>
          </div>
        </div>
        {/* form  */}
        <form
          onSubmit={handleSubmit}
          className="border-2 border-dashed border-zinc-700 rounded-xl p-8 bg-zinc-900/50 backdrop-blur-sm shadow-2xl"
        >
          <div className="space-y-6">

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-foreground mb-2">
                Device Code
              </label>
              <input
                id="code"
                type="text"
                value={userCode}
                onChange={handleCodeChange}
                placeholder="XXXX-XXXX"
                maxLength={9}
                disabled={isLoading}
                className={`w-full px-4 py-3 
                  bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-lg 
                  text-foreground placeholder-zinc-500 focus:outline-none focus:border-indigo-600
                  font-mono text-center text-lg tracking-widest transition duration-150
                  ${error ? 'border-red-500' : ''}
                `}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Find this code on the device you want to authorize.
              </p>
            </div>
            {error && (
              <div className="text-sm text-red-400 bg-red-900/30 p-3 rounded-lg border border-red-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            <Button
              type="submit"
              disabled={isLoading || userCode.length < 9}
              className="w-full py-3 px-4 bg-zinc-200 text-red-950 font-semibold rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                "Verifying...."
              ) : (
                "Continue...."
              )}
            </Button>
          <div>
            <p>This code is unique to your device and will expire and will shortly . keep it confidential and never share it with anyone</p>
          </div>
          
      </div>
    </form>
  </div >
  </div>
);
};

export default DeviceAuthorizationPage;