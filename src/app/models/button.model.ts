export interface IButton {
  title: string;
  icon?: string;
  image?: string;
  do: () => Promise<void> | void;
}
