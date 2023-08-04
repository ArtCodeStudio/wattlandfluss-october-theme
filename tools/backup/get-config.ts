import { exec } from 'child_process';
import { resolve } from 'path';
import { config } from 'dotenv';

// Load OctoberCMS .env file
config({ path: resolve(__dirname, '../../../../.env') });

export interface OctoberCMSConfig {
    database: {
        fetch: number;
        default: 'mysql' | 'sqlite' | 'pgsql' | 'sqlsrv';
        connections: {
            sqlite: any;
            mysql: {
                driver: 'mysql';
                host: string;
                port: number;
                database: string;
                username: string;
                password: string;
                charset: string;
                collation: string;
                prefix: string;
            };
            pgsql: any;
            sqlsrv: any;
        };
        migrations: 'migrations';
        redis: { cluster: false; default: any };
        useConfigForTesting: boolean;
    };
    app: any;
    cms: any;
}

export const getOctoberCmsConfig = async () => {
    const cmd = `php get-config.php`;

    return new Promise<OctoberCMSConfig>((resolve, reject) => {
        exec(cmd, { env: { ...process.env } }, function (error, stdout) {
            try {
                const config = JSON.parse(stdout);
                resolve(config);
            } catch (error: any) {
                if (typeof error?.message === 'string') {
                    error = new Error((error.message += '\nstdout: ' + stdout));
                } else {
                    console.error(stdout);
                }
                reject(error);
            }

            if (error) {
                reject(error);
            }
        });
    });
};