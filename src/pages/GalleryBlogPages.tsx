import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

export function GalleryPage() {
  const { bootstrap, navigate } = useClinic();
  const galleryItems = bootstrap?.galleryItems || [];
  const [filter, setFilter] = useState('all');

  const categories = Array.from(new Set(galleryItems.map((g) => g.treatmentCategory)));
  const visible =
    filter === 'all' ? galleryItems : galleryItems.filter((g) => g.treatmentCategory === filter);

  return (
    <div className="bg-white">
      <section className="bg-[#FAF8F2] border-b border-[#EAE4D3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
            Consent-Verified Cases
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#36363A]">Smile Gallery</h1>
          <p className="text-base text-[#444448] max-w-2xl">
            Only cases with signed patient photo consent on file are published here. Individual results vary.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer ${
                filter === 'all' ? 'bg-[#444448] text-white' : 'bg-[#FAF8F2] text-[#444448]'
              }`}
            >
              All Cases
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer ${
                  filter === cat ? 'bg-[#444448] text-white' : 'bg-[#FAF8F2] text-[#444448]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {visible.length === 0 ? (
          <div className="bg-[#FAF8F2] border border-[#EAE4D3] rounded-lg p-10 text-center space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-[#36363A]">
              Consent-Verified Smile Cases Coming Soon
            </h2>
            <p className="text-sm text-[#444448] max-w-lg mx-auto">
              Laurette Medical Center never publishes stock smile photos or unconsented clinical imagery. Approved patient cases will appear here once uploaded with consent on file.
            </p>
            <button
              type="button"
              onClick={() => navigate('/book')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#C6A64B] text-white text-sm font-medium hover:bg-[#A68834] cursor-pointer min-h-[44px]"
            >
              <Calendar className="w-4 h-4" />
              <span>Book a Consultation</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {visible.map((item) => (
              <div key={item.id} className="border border-[#EAE4D3] rounded-lg overflow-hidden bg-white">
                <div className="grid grid-cols-2 gap-1 bg-[#FAF8F2]">
                  <img
                    src={item.beforeImageUrl}
                    alt={`${item.title} before`}
                    referrerPolicy="no-referrer"
                    className="w-full h-56 object-cover"
                  />
                  <img
                    src={item.afterImageUrl}
                    alt={`${item.title} after`}
                    referrerPolicy="no-referrer"
                    className="w-full h-56 object-cover"
                  />
                </div>
                <div className="p-5 space-y-1.5">
                  <p className="text-xs text-[#A68834] font-medium">{item.treatmentCategory}</p>
                  <h3 className="font-serif text-2xl font-semibold text-[#36363A]">{item.title}</h3>
                  <p className="text-xs text-[#444448]">Individual results vary. {item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function BlogPage({ slug }: { slug?: string }) {
  const { bootstrap, navigate } = useClinic();
  const posts = bootstrap?.blogPosts || [];

  if (slug) {
    const post = posts.find((p) => p.slug === slug);
    if (!post) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-16 space-y-4">
          <p className="text-base text-[#444448]">Article not found.</p>
          <button
            type="button"
            onClick={() => navigate('/blog')}
            className="text-sm font-medium text-[#A68834] underline cursor-pointer"
          >
            Return to Patient Journal
          </button>
        </div>
      );
    }

    return (
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-8">
        <button
          type="button"
          onClick={() => navigate('/blog')}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#444448] hover:text-[#36363A] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Journal</span>
        </button>

        <header className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-[#A68834] font-medium">
            <span>{post.category}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readingMinutes} min read
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#36363A] leading-tight">
            {post.title}
          </h1>
          <p className="text-sm text-[#444448]">{post.reviewedBy}</p>
        </header>

        <div className="aspect-[16/9] rounded-lg overflow-hidden border border-[#EAE4D3]">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-5 text-base text-[#36363A] leading-relaxed whitespace-pre-line">
          {post.content}
        </div>
      </article>
    );
  }

  return (
    <div className="bg-white">
      <section className="bg-[#FAF8F2] border-b border-[#EAE4D3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
            Patient Education · Dubai
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#36363A]">
            Patient Journal
          </h1>
          <p className="text-base text-[#444448] max-w-2xl">
            Plain-language guides to preparing for dental appointments and understanding AED estimates. General educational information only; not medical advice.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div
            key={post.id}
            className="border border-[#EAE4D3] rounded-lg overflow-hidden bg-white flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[4/3] overflow-hidden bg-[#FAF8F2]">
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="text-xs text-[#A68834] font-medium flex items-center gap-2">
                  <span>{post.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.readingMinutes} min read</span>
                </div>
                <h2 className="font-serif text-2xl font-semibold text-[#36363A]">{post.title}</h2>
                <p className="text-sm text-[#444448] leading-relaxed">{post.excerpt}</p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <button
                type="button"
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="text-sm font-medium text-[#A68834] hover:underline cursor-pointer"
              >
                Read Article
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
