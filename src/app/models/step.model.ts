
export interface Step {
    code: string;
    name: string;
    name_fr: string;
    startedAt: string;
    targetTeam: string;
    assignee: string;
    inProgress: boolean;
    completed: boolean;
    completedDate: string;
    completionAction: string;
    completionAction_fr: string;
    completedBy: string;
    showMap: boolean;
    canceled: boolean;
    canceledDate: string;
    canceledBy: string;
    index: number;
    btnOK: string;
    btnKO: string;
}