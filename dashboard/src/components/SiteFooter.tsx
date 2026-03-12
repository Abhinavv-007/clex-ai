export default function SiteFooter() {
  return (
    <footer className="relative z-20 mt-auto w-full border-t border-white/10 bg-[#02050f]/80 py-8 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-center gap-6 px-6 text-sm text-gray-400 md:justify-between md:px-12 lg:px-20">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white/20" />
          <span>{`© ${new Date().getFullYear()} clex.in. All rights reserved.`}</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
          <a href="https://clex.in/support.html" className="transition-colors hover:text-cyan-300">
            Support
          </a>
          <a href="https://clex.in/privacy.html" className="transition-colors hover:text-cyan-300">
            Privacy Policy
          </a>
          <a href="https://clex.in/terms.html" className="transition-colors hover:text-cyan-300">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
