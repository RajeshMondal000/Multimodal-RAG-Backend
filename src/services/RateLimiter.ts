export class RateLimiter {

    constructor(
        private kv: KVNamespace
    ) {}

    async check(
        key: string,
        limits: {
            limit: number;
            windowSeconds: number;
            suffix: string;
        }[]
    ) {

        for (const rule of limits) {

            const kvKey = `${key}:${rule.suffix}`;

            const current = await this.kv.get(kvKey);

            let count = current
                ? Number(current)
                : 0;

            if (count >= rule.limit) {

                return {
                    allowed: false,
                    limit: rule.limit,
                    windowSeconds: rule.windowSeconds,
                };

            }

            count++;

            await this.kv.put(
                kvKey,
                count.toString(),
                {
                    expirationTtl: rule.windowSeconds,
                }
            );

        }

        return {
            allowed: true,
        };

    }

}