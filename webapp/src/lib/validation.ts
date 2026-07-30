import { z } from "zod";

export const SignupSchema = z.object({
  name: z.string().trim().min(2, "Нэр дор хаяж 2 тэмдэгттэй байх ёстой."),
  email: z.string().trim().email("Зөв имэйл хаяг оруулна уу."),
  phone: z.string().trim().min(6, "Утасны дугаараа оруулна уу.").default(""),
  password: z.string().min(6, "Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой."),
});

export const LoginSchema = z.object({
  email: z.string().trim().email("Зөв имэйл хаяг оруулна уу."),
  password: z.string().min(1, "Нууц үгээ оруулна уу."),
});

const SLUG_REGEX = /^[a-z0-9-]+$/;

export const ProductSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().toLowerCase().regex(SLUG_REGEX, "Slug зөвхөн жижиг латин үсэг, тоо, зураас агуулна."),
  description: z.string().trim().default(""),
  price: z.coerce.number().positive(),
  unit: z.string().trim().min(1),
  categoryId: z.string().trim().min(1, "Ангилал сонгоно уу."),
  subcategoryId: z.string().trim().nullable().default(null),
  imageUrl: z.string().trim().url(),
  stock: z.coerce.number().int().min(0),
  featured: z.coerce.boolean().default(false),
});

export const CategorySchema = z.object({
  name: z.string().trim().min(2, "Ангиллын нэр дор хаяж 2 тэмдэгттэй байх ёстой."),
  slug: z.string().trim().toLowerCase().regex(SLUG_REGEX, "Slug зөвхөн жижиг латин үсэг, тоо, зураас агуулна."),
});

export const SubcategorySchema = z.object({
  name: z.string().trim().min(2, "Дэд ангиллын нэр дор хаяж 2 тэмдэгттэй байх ёстой."),
  slug: z.string().trim().toLowerCase().regex(SLUG_REGEX, "Slug зөвхөн жижиг латин үсэг, тоо, зураас агуулна."),
  categoryId: z.string().trim().min(1, "Харьяалагдах ангиллаа сонгоно уу."),
});

export const OrderCreateSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Сагс хоосон байна."),
  address: z.string().trim().min(3, "Хүргэлтийн хаягаа оруулна уу."),
  phone: z.string().trim().min(6, "Утасны дугаараа оруулна уу."),
  note: z.string().trim().default(""),
});
