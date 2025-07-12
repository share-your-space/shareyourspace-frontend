import Image from "next/image";

export default function PilotPartners() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
            Our Pilot Partners
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Trusted by Leading Companies
          </h2>
          <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            We are proud to partner with these innovative companies during our pilot phase.
          </p>
        </div>
        <div className="divide-y rounded-lg border">
          <div className="grid w-full grid-cols-3 items-stretch justify-center divide-x md:grid-cols-5">
            <div className="mx-auto flex w-full items-center justify-center p-4 sm:p-8">
              <Image
                alt="Logo"
                className="aspect-[2/1] overflow-hidden rounded-lg object-contain object-center"
                height="70"
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE4fHx8ZW58MHx8fHx8"
                width="140"
              />
            </div>
            <div className="mx-auto flex w-full items-center justify-center p-4 sm:p-8">
              <Image
                alt="Logo"
                className="aspect-[2/1] overflow-hidden rounded-lg object-contain object-center"
                height="70"
                src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDEzfHx8ZW58MHx8fHx8"
                width="140"
              />
            </div>
            <div className="mx-auto flex w-full items-center justify-center p-4 sm:p-8">
              <Image
                alt="Logo"
                className="aspect-[2/1] overflow-hidden rounded-lg object-contain object-center"
                height="70"
                src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDEwfHx8ZW58MHx8fHx8"
                width="140"
              />
            </div>
            <div className="mx-auto flex w-full items-center justify-center p-4 sm:p-8">
              <Image
                alt="Logo"
                className="aspect-[2/1] overflow-hidden rounded-lg object-contain object-center"
                height="70"
                src="https://images.unsplash.com/photo-1556740772-1a741367b93e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE1fHx8ZW58MHx8fHx8"
                width="140"
              />
            </div>
            <div className="mx-auto flex w-full items-center justify-center p-4 sm:p-8">
              <Image
                alt="Logo"
                className="aspect-[2/1] overflow-hidden rounded-lg object-contain object-center"
                height="70"
                src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE2fHx8ZW58MHx8fHx8"
                width="140"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
