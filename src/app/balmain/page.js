import Products from "../../components/products";

export default function Balmain() {
  return (
    <div className="">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">
          Balmain
        </h2>
        <p className="text-gray-600 text-base md:text-lg mb-6">
          Balmain es una marca de moda francesa. Fundada en 1945, destaca por prendas de lujo con detalles modernos y elegantes. Su diseño combina la herencia parisina con un toque contemporáneo, siendo un ícono en la alta moda.
        </p>
        <Products brand="balmain" />
      </div>
    </div>
  );
}
