import { Link } from "react-router-dom";
import { categories } from "@/data/categories";

const CategoryGrid = () => {
  return (
    <section className="py-6">
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
        Catégories
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              to={`/categorie/${cat.id}`}
              className={`${cat.bgColor} rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow text-center group`}
            >
              <div className={`p-3 rounded-full bg-white/70 ${cat.color} group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-foreground leading-tight">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryGrid;
