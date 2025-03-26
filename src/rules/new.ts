import { Config, File, Octokit, Rule } from "../types.js";

export default async function (
    _octokit: Octokit,
    config: Config,
    files: File[],
): Promise<Rule[]> {
    // Get results
    const res: Rule[][] = await Promise.all(
        files.map((file) => {
            const considerFile =
                file.status.toLowerCase() == "added" &&
                /^content\/[0-9]+(\/index)?.md$/.test(file.filename);

            if (!considerFile) {
                return [];
            }

            let reviewers = config.members;
            if (!config.members || !config.members.length) {
                reviewers = config.editors;
            }

            return [
                {
                    name: "new",
                    reviewers,
                    min: 1,
                    annotation: {
                        file: file.filename,
                    },
                    labels: ["e-review"],
                },
            ];
        }),
    );

    // Merge results
    const ret: Rule[] = [];
    res.forEach((val) => ret.push(...val));
    return ret;
}
