import { MemberEventInterface } from "@/interfaces";
import { ControllerReturnType } from "../../interface";
import { handleMemberAddedEvent } from "./controllers/added";
import { handleMemberEditedEvent } from "./controllers/edited";
import { handleMemberRemovedEvent } from "./controllers/removed";

async function handleMemberEvent(body: MemberEventInterface): Promise<ControllerReturnType> {
    switch (body.action) {
        case "added":
            return await handleMemberAddedEvent(body);
        case "edited":
            return await handleMemberEditedEvent(body);
        case "removed":
            return await handleMemberRemovedEvent(body);
    }
}