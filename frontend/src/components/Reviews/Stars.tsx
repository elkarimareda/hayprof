import { Star } from "lucide-react";

interface Props {
  rating: number;
}

function Stars({ rating }: Props) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          className={`w-4 h-4 ${
            index < Math.floor(rating)
              ? "text-black fill-current"
              : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating?.toFixed(1)})</span>
    </div>
  );
}

export default Stars;
