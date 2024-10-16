import Products from "../../components/products";

export default function Guess() {
  return (
    <div >
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">
          Guess
        </h2>
        <p className="text-gray-600 text-base md:text-lg mb-6">
          Guess es una marca de moda estadounidense. Fundada en 1981, se especializa en ropa, accesorios y calzado que capturan la esencia de la cultura juvenil y la innovación. Guess es conocida por sus icónicas campañas publicitarias y su enfoque en la calidad.
        </p>
        <Products brand="guess" />
      </div>
    </div>
  );
}
