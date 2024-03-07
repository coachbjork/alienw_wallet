import type { Authorization } from './Authorization';

export interface Transaction_Action {
    sc_account: string;
    action: {
        name: string;
        fields: any[];
        authorization: Authorization[];
        base: string;
    },
    sc_actions: any[];
    data: any;
}