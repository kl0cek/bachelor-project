import { Button } from "../ui";

export const ErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-red-600">
    <p className="text-sm font-medium">{error}</p>
    <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
      Try opening in new tab
    </Button>
  </div>
);