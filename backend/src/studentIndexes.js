import { Student } from "./models.js";

let indexPromise = null;

function isAdmissionIndex(index) {
  return (
    index?.key?.schoolId === 1 &&
    index?.key?.admissionNo === 1
  );
}

function isDesiredIndex(index) {
  return (
    isAdmissionIndex(index) &&
    index.unique === true &&
    index.partialFilterExpression?.admissionNo?.$type === "string"
  );
}

export async function ensureStudentIndexes() {
  if (indexPromise) {
    return indexPromise;
  }

  indexPromise = (async () => {
    const indexes = await Student.collection.indexes();
    const oldIndex = indexes.find(isAdmissionIndex);

    if (oldIndex && !isDesiredIndex(oldIndex)) {
      try {
        await Student.collection.dropIndex(oldIndex.name);
      } catch (error) {
        if (error?.codeName !== "IndexNotFound") {
          throw error;
        }
      }
    }

    await Student.updateMany(
      {
        admissionNo: "",
      },
      {
        $set: {
          admissionNo: null,
        },
      }
    );

    const refreshedIndexes =
      await Student.collection.indexes();

    if (
      !refreshedIndexes.some(isDesiredIndex)
    ) {
      await Student.collection.createIndex(
        {
          schoolId: 1,
          admissionNo: 1,
        },
        {
          unique: true,
          name: "schoolId_1_admissionNo_1",
          partialFilterExpression: {
            admissionNo: {
              $type: "string",
            },
          },
        }
      );
    }

    return true;
  })();

  try {
    return await indexPromise;
  } catch (error) {
    indexPromise = null;
    throw error;
  }
}
