export default function HowItWorks() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
            How It Works
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            A Seamless Experience for All
          </h2>
          <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            Whether you&apos;re a startup looking for a dynamic workspace or a company wanting to monetize your extra space, our platform makes it easy.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-12 py-12 lg:grid-cols-3 lg:gap-8">
          <div className="grid gap-1 text-center">
            <div className="flex items-center justify-center">
              <CircleNumber number="1" />
            </div>
            <h3 className="text-lg font-bold">Discover & Book</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Startups and freelancers can easily browse unique workspaces and book with a few clicks.
            </p>
          </div>
          <div className="grid gap-1 text-center">
            <div className="flex items-center justify-center">
              <CircleNumber number="2" />
            </div>
            <h3 className="text-lg font-bold">List Your Space</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Corporate partners can list their underutilized desks, offices, or entire floors in minutes.
            </p>
          </div>
          <div className="grid gap-1 text-center">
            <div className="flex items-center justify-center">
              <CircleNumber number="3" />
            </div>
            <h3 className="text-lg font-bold">Connect & Innovate</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Experience a new way of working. Connect with innovators, share ideas, and grow your network.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CircleNumber({ number }: { number: string }) {
  return (
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-900 text-white font-bold text-xl">
      {number}
    </div>
  );
}
