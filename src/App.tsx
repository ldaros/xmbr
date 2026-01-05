import { useState } from "react";
import { WaveBackground } from "@/components/xmb/wave-background";
import { XMBMenu } from "@/components/xmb/xmb-menu";
import { ColdBoot } from "@/components/xmb/cold-boot";

function App() {
    const [bootComplete, setBootComplete] = useState(false);

    return (
        <main className="min-h-screen w-full overflow-hidden font-sans antialiased text-foreground">
            {!bootComplete && (
                <ColdBoot onComplete={() => setBootComplete(true)} />
            )}

            <WaveBackground />

            <div
                className={`transition-opacity duration-1000 ${
                    bootComplete ? "opacity-100" : "opacity-0"
                }`}
            >
                <XMBMenu disabled={!bootComplete} />
            </div>
        </main>
    );
}

export default App;
