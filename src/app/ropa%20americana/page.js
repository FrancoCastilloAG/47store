import Products from "../../components/products";

export default function RopaAmericana() {
  return (
    <div>
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">
          Ropa Americana
        </h2>
        <p className="text-gray-600 text-base md:text-lg mb-6">
          La Ropa Americana ofrece prendas de primera calidad premium. Asegurando que nuestros clientes reciban lo mejor en moda. Descubre nuestra colección y disfruta de la durabilidad y el estilo en cada prenda.
        </p>
        <Products brand="ropa americana" />
      </div>
    </div>
  );
}
