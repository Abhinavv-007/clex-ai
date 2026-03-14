export default function SiteFooter() {
  return (
    <footer className="relative z-20 mt-auto w-full border-t border-white/10 bg-[#02050f]/80 py-8 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-6 text-sm text-gray-400 md:px-12 lg:px-20">
        <div className="flex flex-wrap items-center justify-center md:justify-between gap-6">
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

        {/* Branding Links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs font-medium tracking-wide">
          <div className="flex flex-wrap items-center justify-center gap-3 text-gray-500">
            <span className="text-gray-400">A project by <a href="https://abhnv.in" target="_blank" rel="noreferrer" className="text-white hover:text-[#c9a96e] transition-colors">Abhinav</a></span>
            <span className="text-gray-700 hidden sm:inline">|</span>
            <a href="https://abhnv.in" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">abhnv.in</a>
            <span className="text-gray-700 hidden sm:inline">|</span>
            <a href="https://abhnv.me" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">abhnv.me</a>
            <span className="text-gray-700 hidden sm:inline">|</span>
            <a href="https://lnch.in" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">lnch.in</a>
          </div>
          <a href="https://www.linkedin.com/in/abhnv07/" target="_blank" rel="noreferrer" className="group flex items-center gap-2 text-gray-500 hover:text-[#0a66c2] transition-colors" aria-label="LinkedIn">
            <svg className="h-4 w-4 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span className="text-[10px] uppercase tracking-[0.1em] font-bold">Connect</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
