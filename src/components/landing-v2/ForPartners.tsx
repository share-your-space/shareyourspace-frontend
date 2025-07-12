import Image from "next/image";

export default function ForPartners() {
  return (
    <section className="py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
              For Partners
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Unlock New Revenue Streams and Foster Innovation
            </h2>
            <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Partner with ShareYourSpace to monetize your underutilized office spaces. Provide a dynamic environment for startups and freelancers, fostering a culture of innovation and collaboration right within your own walls.
            </p>
            <ul className="grid gap-2 py-4">
              <li>
                <CheckIcon className="mr-2 inline-block h-4 w-4" />
                Seamlessly list and manage your available spaces.
              </li>
              <li>
                <CheckIcon className="mr-2 inline-block h-4 w-4" />
                Connect with a curated community of innovators.
              </li>
              <li>
                <CheckIcon className="mr-2 inline-block h-4 w-4" />
                Generate passive income from your existing assets.
              </li>
            </ul>
          </div>
          <div className="grid gap-4 sm:gap-6">
            <Image
              alt="Image"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
              height="310"
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              width="550"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
