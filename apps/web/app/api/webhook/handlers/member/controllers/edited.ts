import { MemberEventInterface } from '@/interfaces';
import prisma from '@/lib/prisma';
import { ControllerReturnType } from '../../../interface';

export async function handleMemberEditedEvent(body: MemberEventInterface): Promise<ControllerReturnType> {
    const { member, repository } = body;

    try {
        const user = await prisma.user.findUnique({
            where: { github_id: member.id.toString() },
        });

        const updatedMaintainer = await prisma.repositoryMaintainer.updateMany({
            where: {
                AND: [
                    { github_id: member.id.toString() },
                    { repository: { github_repo_id: repository.id.toString() } }
                ]
            },
            data: {
                role: 'MAINTAINER',
            },
        });

        return {
            statusCode: 200,
            message: 'Member edited successfully',
            success: true,
            data: updatedMaintainer,
        };
    } catch (error) {
        console.error('Error handling member edited event:', error);
        return {
            statusCode: 500,
            message: 'Internal Server Error',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}




// CONTINUE