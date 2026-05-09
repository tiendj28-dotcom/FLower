export default function IntroVideoSection({ videoId }) {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-14 sm:py-16 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-amber-600 font-bold sm:text-xl lg:text-2xl tracking-widest uppercase mb-3">
            Giới thiệu
          </p>
          <h5 className="text-xl sm:text-lg lg:text-2xl text-gray-700 dark:text-gray-300 mb-3 leading-tight">
            Một chút thư giãn với hoa tươi 
          </h5>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Một chút không gian, một chút hương thơm — và rất nhiều cảm hứng từ các loài hoa.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-black">
          <div className="relative w-full pt-[56.25%]">
          <img
  className="absolute inset-0 w-full h-full object-cover"
  src="https://cdn.hpdecor.vn/wp-content/uploads/2022/05/thiet-ke-shop-hoa-tuoi-2.jpg"
  alt="Flower shop"
/>
          </div>
        </div>
      </div>
    </section>
  );
}
