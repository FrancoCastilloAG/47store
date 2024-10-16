import Products from "../../components/products";

export default function TommyHilfiger() {
  return (
    <div>
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">
          Tommy Hilfiger
        </h2>
        <p className="text-gray-600 text-base md:text-lg mb-6">
          Tommy Hilfiger es una marca icónica estadounidense. Fundada en 1985, se destaca por sus prendas casuales y elegantes que reflejan la cultura y el estilo de vida americano.
        </p>
        <Products brand="tommy hilfiger" />
      </div>
    </div>
  );
}
