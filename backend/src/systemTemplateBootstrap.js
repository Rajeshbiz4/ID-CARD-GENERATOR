import { Template } from "./models.js";
import { SYSTEM_TEMPLATES } from "./systemTemplates.js";
import { FACULTY_SYSTEM_TEMPLATES } from "./facultyTemplates.js";

const ALL_SYSTEM_TEMPLATES = [
  ...SYSTEM_TEMPLATES.map(
    (template) => ({
      ...template,
      cardFor: "STUDENT",
    })
  ),
  ...FACULTY_SYSTEM_TEMPLATES,
];

let bootstrapPromise = null;

/**
 * Guarantees that the predefined system template library exists.
 *
 * This is intentionally safe to run more than once:
 * - custom school templates are never touched
 * - the current system templates are upserted/updated
 * - old/legacy system templates are deactivated
 *
 * This fixes Vercel deployments where `npm run seed` was not executed.
 */
export async function ensureSystemTemplates(
  { force = false } = {}
) {
  if (
    bootstrapPromise &&
    !force
  ) {
    return bootstrapPromise;
  }

  const currentPromise = (async () => {
    const validSlugs = ALL_SYSTEM_TEMPLATES.map((template) => template.slug);

    // Deactivate old predefined templates not in the current system-template library
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

    if (ALL_SYSTEM_TEMPLATES.length > 0) {
      await Template.bulkWrite(
        ALL_SYSTEM_TEMPLATES.map((template) => ({
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
      `System templates ready: ${activeSystemCount}/${ALL_SYSTEM_TEMPLATES.length}`
    );

    return activeSystemCount;
  })();

  if (!force) {
    bootstrapPromise =
      currentPromise;
  }

  try {
    return await currentPromise;
  } catch (error) {
    if (!force) {
      bootstrapPromise = null;
    }

    throw error;
  }
}
