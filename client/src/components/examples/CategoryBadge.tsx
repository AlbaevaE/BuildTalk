import CategoryBadge from '../CategoryBadge';

export default function CategoryBadgeExample() {
  return (
    <div className="flex gap-2 p-4">
      <CategoryBadge category="construction" />
      <CategoryBadge category="furniture" variant="outline" />
      <CategoryBadge category="services" variant="default" />
    </div>
  );
}