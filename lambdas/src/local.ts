import { handler as generateMessagesHandler } from "./handlers/generateMessages";
import { handler as sendDailyHandler } from "./handlers/sendDaily";

async function main() {
    const arg = process.argv[2];
    if (arg === "generate") {
        const result = await generateMessagesHandler();
        console.log("generateMessages result:", result);
    } else if (arg === "send") {
        const result = await sendDailyHandler();
        console.log("sendDaily result:", result);
    } else {
        console.log("Usage: ts-node src/local.ts [generate|send]");
    }
}

main();
