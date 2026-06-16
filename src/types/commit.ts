export interface CommitDTO {
  sha: string;
  message: string;
  url: string;
  author: string | null;
}
