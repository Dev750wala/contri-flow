import { InstallationRepositories, RepositoryRenamedWebhookPayload } from "@/interfaces";
import { ControllerReturnType } from "../../interface";
import { handleRepositoriesRenamedEvent } from "./controllers";


export async function handleRepositoriesEvent(body: RepositoryRenamedWebhookPayload): Promise<ControllerReturnType> {
    switch (body.action) {
        case "renamed":
            return await handleRepositoriesRenamedEvent(body);
            
    }
}