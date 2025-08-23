export default function AboutPage() {
  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Work Sans", "Noto Sans", sans-serif' }}
    >
      <div>
        <h2 className="text-[#181411] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
          Our Story
        </h2>
        <p className="text-[#181411] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
          At [Store Name], we believe in the beauty of simplicity. Our curated
          collection of minimalist goods is designed to enhance your everyday
          life with understated elegance and timeless style. We source
          high-quality materials and collaborate with skilled artisans to create
          pieces that are both functional and aesthetically pleasing.
        </p>
        <div className="flex w-full grow bg-white @container py-3">
          <div className="w-full gap-1 overflow-hidden bg-white @[480px]:gap-2 aspect-[3/2] flex">
            <div
              className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none flex-1"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCNj0A8GDaoS1UMjpAWiRUVI9SOgs2xZbNi1RFLI5Ng6mNBHhBafk_KdqxUJZSTgb5JGIMpi4GC1zMCTuV3Bqf4UNXO9Nju9AQNV7XYHvxAeaFisdWryD1j9g3-CKnM_WmGO3BfxbVSRgIraeH2BFmVKYYeGKGcXlU_AmIcBSuZPRgxU3UCAmxd-0IY8tARMalvTzCGtkkz9WL_zXUeq5NMu4ytrkHgScmnFlS-UbEdIOMkZ1Vb0No0InfQM5SdcU4kC_GIWEKmAd4")',
              }}
            ></div>
          </div>
        </div>
        <h2 className="text-[#181411] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Our Philosophy
        </h2>
        <p className="text-[#181411] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
          We are committed to sustainability and ethical practices. Our products
          are made with care, minimizing environmental impact and supporting
          fair labor. We believe in mindful consumption, choosing quality over
          quantity, and creating a home that reflects your personal style and
          values.
        </p>
        <h2 className="text-[#181411] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Meet the Team
        </h2>
        <div className="flex items-center px-4 py-3 justify-center">
          <div className="overflow-visible w-[34px]">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover border-white bg-[#f4f2f0] text-[#887563] rounded-full flex items-center justify-center size-11 border-4"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA8dAvjDH_PLKI96NCXE7uHmq9Ogt9ystAnDkQfLxhm-KH6LLZZPtoblBQ-nwgiIUkhXnY3aeiUTdOP1qZB6jLSA6WXfoswcEeTel2AhujUatn1x7ptvQFGT6y_W34zL4B91-qsyyqSmzpKv--uQNnNbVvWmnd6Vy-RLPLPGF_OijHAOdZ-AGOgYW9HJZMipGuX-PYdSdt5lQEz8rxMiWiy_T9_vAEEIaVKoLUb-Yy7bzs7ONbTNwxIk556Zo09V4hMzv9Ib3-VKug")',
              }}
            ></div>
          </div>
          <div className="overflow-visible w-[34px]">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover border-white bg-[#f4f2f0] text-[#887563] rounded-full flex items-center justify-center size-11 border-4"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBGQU7y1OktkNxVGhmnquBarohWwLG652pKwcA09Za2dG0Ct0o5iSkJ8DCXG8p3r5zG7dr0_hdZmbW9mnYgVwZVHTjKtuvpxO-VElSO_Q8fty3DUeswR2GiGcwqnIos4x8v7QDUzSU8sP_w84OgU7QCLa_PSKozKZl5NJn6o-TmyaPE5p7bOrIj8qhqmUeHFYzesXrLd72XJDy1C90sSs91SeQzCNYxXPvx2aNor1A5PDPLjw1MHaj6fcmTU8rDqkbHcDtPw8uo_cY")',
              }}
            ></div>
          </div>
          <div className="overflow-visible w-11">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover border-white bg-[#f4f2f0] text-[#887563] rounded-full flex items-center justify-center size-11 border-4"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCibI4QPCd93aNymR8T12KDQIZKiTvuTW3Xa5BC8wg3jgUnvdNqGomIK7-C9TGx3hSlu3u8M0Oo826VXvPJ8dLJ0duqiOs49ngcXLdCbasi4PMOScy47sb0dqmp-_xo_El4sH0n3MXGIFeqQunAhKqyeLw5sZ0qgxBW7MMIvCpurrkgPJ9U-0XzeXu7avU7EUTeVavU0qc0rZwyB21R0Pk-w3GTebsbfhQLZLjqbIMMMOo7BkyCzE35qni4rexSB3lkLQQgYGbOhyE")',
              }}
            ></div>
          </div>
        </div>
        <p className="text-[#181411] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
          Our team is passionate about design and dedicated to providing
          exceptional customer service. We are here to help you find the perfect
          pieces for your home and answer any questions you may have.
        </p>
      </div>
    </div>
  );
}
