import { getDatabaseAdapter } from '../index.ts';
import { Review } from '../../../src/services/contentApi.ts';

export class TestimonialsRepository {
  async getAll(): Promise<Review[]> {
    return getDatabaseAdapter().getTestimonials();
  }

  async save(testimonial: Review, userEmail: string): Promise<Review> {
    return getDatabaseAdapter().saveTestimonial(testimonial, userEmail);
  }

  async delete(id: string, userEmail: string): Promise<boolean> {
    return getDatabaseAdapter().deleteTestimonial(id, userEmail);
  }
}

export const testimonialsRepository = new TestimonialsRepository();
