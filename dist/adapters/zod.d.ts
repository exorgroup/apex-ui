import type { ApexValidationAdapter } from '../types';
/**
 * Zod adapter. Pass any object schema.
 *   app.use(ApexUI, { adapter: zodAdapter(UserSchema) })
 * Zod is not a dependency of this package — the schema is duck-typed.
 */
export declare function zodAdapter(schema: {
    safeParse: (v: unknown) => {
        success: boolean;
        error?: {
            issues: Array<{
                path: Array<string | number>;
                message: string;
            }>;
        };
    };
}): ApexValidationAdapter;
