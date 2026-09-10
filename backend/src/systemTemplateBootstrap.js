import { Template } from "./models.js";
import { SYSTEM_TEMPLATES } from "./systemTemplates.js";

let bootstrapPromise = null;

/**
 * Guarantees that the predefined system template library exists.
 *
 * This is intentionally safe to run more than once:
 * - custom school templates are never touched
 * - the 100 system templates are upserted/updated
 * - old/legacy system templates are deactivated
 *
 * This fixes Vercel deployments where `npm run seed` was not executed.
 */
export async function ensureSystemTemplates() {
  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  bootstrapPromise = (async () => {
    const validSlugs = SYSTEM_TEMPLATES.map((template) => template.slug);

    // Deactivate old predefined templates not in the current 100-template library
    // without touching any school-created CUSTOM template.
    await Template.updateMany(
      {
        type: "SYSTEM",
        slug: { $nin: validSlugs },
      },
      {
        $set: {
          active: false,
          isDeleted: true,
        },
      }
    );

    if (SYSTEM_TEMPLATES.length > 0) {
      await Template.bulkWrite(
        SYSTEM_TEMPLATES.map((template) => ({
          updateOne: {
            filter: {
              slug: template.slug,
            },
            update: {
              $set: template,
            },
            upsert: true,
          },
        })),
        {
          ordered: false,
        }
      );
    }

    const activeSystemCount = await Template.countDocuments({
      type: "SYSTEM",
      active: true,
      isDeleted: false,
    });

    console.log(
      `System templates ready: ${activeSystemCount}/${SYSTEM_TEMPLATES.length}`
    );

    return activeSystemCount;
  })();

  try {
    return await bootstrapPromise;
  } catch (error) {
    bootstrapPromise = null;
    throw error;
  }
}
