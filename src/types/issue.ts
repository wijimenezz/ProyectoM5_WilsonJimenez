export interface IssueDTO {
  id: number;
  number: number;
  title: string;
  state: string;
  url: string;
  body: string | null;
}
