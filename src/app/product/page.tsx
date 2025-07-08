import { getProducts } from './actions';
import { ProductCard } from './product-card';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">All Products</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Browse our selection of sustainable and everyday items.
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-xl">
            No products found.
          </p>
           <p className="text-muted-foreground mt-2">
            Please check back later or make sure the `products` collection is populated in Firestore.
          </p>
        </div>
      )}
    </div>
  );
}
