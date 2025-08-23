export default function ContactPage() {
	return (
		<div
			className="relative flex size-full min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden"
			style={{ fontFamily: '"Work Sans", "Noto Sans", sans-serif' }}
		>
			<div>
				<div className="flex items-center bg-white p-4 pb-2 justify-between">
					<div className="text-[#181411] flex size-12 shrink-0 items-center" data-icon="ArrowLeft" data-size="24px" data-weight="regular">
						<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
							<path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
						</svg>
					</div>
					<h2 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Contact Us</h2>
				</div>
				<h1 className="text-[#181411] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-3 pt-5">Get in touch</h1>
				<p className="text-[#181411] text-base font-normal leading-normal pb-3 pt-1 px-4">
					We're here to help! If you have any questions, feedback, or concerns, please don't hesitate to reach out to us. We'll do our best to respond within 24 hours.
				</p>
				<h3 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Contact Information</h3>
				<div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2">
					<div className="text-[#181411] flex items-center justify-center rounded-lg bg-[#f4f2f0] shrink-0 size-12" data-icon="Envelope" data-size="24px" data-weight="regular">
						<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
							<path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-96,85.15L52.57,64H203.43ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05,58,53.15H52.57ZM157.29,128,216,74.18V181.82Z" />
						</svg>
					</div>
					<div className="flex flex-col justify-center">
						<p className="text-[#181411] text-base font-medium leading-normal line-clamp-1">Email</p>
						<p className="text-[#887563] text-sm font-normal leading-normal line-clamp-2">support@minimaliststore.com</p>
					</div>
				</div>
				<div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2">
					<div className="text-[#181411] flex items-center justify-center rounded-lg bg-[#f4f2f0] shrink-0 size-12" data-icon="Phone" data-size="24px" data-weight="regular">
						<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
							<path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46ZM176,208A128.14,128.14,0,0,1,48,80,40.2,40.2,0,0,1,82.87,40a.61.61,0,0,0,0,.12l21,47L83.2,111.86a6.13,6.13,0,0,0-.57.77,16,16,0,0,0-1,15.7c9.06,18.53,27.73,37.06,46.46,46.11a16,16,0,0,0,15.75-1.14,8.44,8.44,0,0,0,.74-.56L168.89,152l47,21.05h0s.08,0,.11,0A40.21,40.21,0,0,1,176,208Z" />
						</svg>
					</div>
					<div className="flex flex-col justify-center">
						<p className="text-[#181411] text-base font-medium leading-normal line-clamp-1">Phone</p>
						<p className="text-[#887563] text-sm font-normal leading-normal line-clamp-2">+1 (555) 123-4567</p>
					</div>
				</div>
				<div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2">
					<div className="text-[#181411] flex items-center justify-center rounded-lg bg-[#f4f2f0] shrink-0 size-12" data-icon="MapPin" data-size="24px" data-weight="regular">
						<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
							<path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z" />
						</svg>
					</div>
					<div className="flex flex-col justify-center">
						<p className="text-[#181411] text-base font-medium leading-normal line-clamp-1">Address</p>
						<p className="text-[#887563] text-sm font-normal leading-normal line-clamp-2">123 Minimalist Ave, Suite 456, Anytown, CA 91234</p>
					</div>
				</div>
			</div>
		</div>
	);
}
