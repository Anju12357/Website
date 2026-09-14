const CUSTOM_PERMISSION_STORAGE_KEY =
  "employee_management_custom_permissions";

export const getCustomPermissionAreas = () => {
  try {
    const saved = localStorage.getItem(
      CUSTOM_PERMISSION_STORAGE_KEY
    );

    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveCustomPermissionAreas = (areas) => {
  const safeAreas = Array.isArray(areas) ? areas : [];

  localStorage.setItem(
    CUSTOM_PERMISSION_STORAGE_KEY,
    JSON.stringify(safeAreas)
  );

  window.dispatchEvent(
    new CustomEvent("ems:permissions-changed", {
      detail: safeAreas,
    })
  );

  return safeAreas;
};

export const slugifyPermission = (value = "") =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");

/**
 * Register a permission from ANY EMS page.
 *
 * Example:
 *
 * registerPermission({
 *   areaId: "employees",
 *   areaTitle: "Employees",
 *   areaIcon: "👥",
 *   areaDescription: "Employee records and actions",
 *   label: "View Google Meet",
 *   description: "View Google Meet controls",
 * });
 */
export const registerPermission = ({
  areaId,
  areaTitle,
  areaIcon = "•",
  areaDescription = "Custom access controls",
  permissionId,
  label,
  description,
}) => {
  const cleanAreaId = String(areaId || "")
    .trim()
    .toLowerCase();

  const cleanLabel = String(label || "").trim();

  const cleanDescription =
    String(description || "").trim() ||
    `Access ${cleanLabel.toLowerCase()}`;

  if (!cleanAreaId || !cleanLabel) {
    throw new Error(
      "areaId and label are required to register a permission."
    );
  }

  const finalPermissionId =
    String(permissionId || "")
      .trim()
      .toLowerCase() ||
    `${cleanAreaId}.${slugifyPermission(cleanLabel)}`;

  const areas = getCustomPermissionAreas();

  const areaIndex = areas.findIndex(
    (area) =>
      String(area?.id || "")
        .trim()
        .toLowerCase() === cleanAreaId
  );

  const permissionTuple = [
    finalPermissionId,
    cleanLabel,
    cleanDescription,
  ];

  if (areaIndex >= 0) {
    const area = areas[areaIndex];

    const permissions = Array.isArray(area.permissions)
      ? area.permissions
      : [];

    const duplicate = permissions.some(
      ([id, existingLabel]) =>
        String(id || "")
          .trim()
          .toLowerCase() === finalPermissionId ||
        String(existingLabel || "")
          .trim()
          .toLowerCase() === cleanLabel.toLowerCase()
    );

    if (duplicate) {
      return {
        added: false,
        permissionId: finalPermissionId,
        areas,
      };
    }

    areas[areaIndex] = {
      ...area,
      title: area.title || areaTitle || cleanAreaId,
      icon: area.icon || areaIcon,
      description:
        area.description || areaDescription,
      permissions: [
        ...permissions,
        permissionTuple,
      ],
    };
  } else {
    areas.push({
      id: cleanAreaId,
      title: areaTitle || cleanAreaId,
      icon: areaIcon,
      description: areaDescription,
      permissions: [permissionTuple],
    });
  }

  saveCustomPermissionAreas(areas);

  return {
    added: true,
    permissionId: finalPermissionId,
    areas,
  };
};

/**
 * Remove one custom permission.
 *
 * Example:
 *
 * removePermission("employees.export.employees");
 */
export const removePermission = (permissionId) => {
  const target = String(permissionId || "")
    .trim()
    .toLowerCase();

  if (!target) {
    return getCustomPermissionAreas();
  }

  const areas = getCustomPermissionAreas()
    .map((area) => ({
      ...area,

      permissions: (
        Array.isArray(area.permissions)
          ? area.permissions
          : []
      ).filter(
        ([id]) =>
          String(id || "")
            .trim()
            .toLowerCase() !== target
      ),
    }))
    .filter(
      (area) =>
        Array.isArray(area.permissions) &&
        area.permissions.length > 0
    );

  saveCustomPermissionAreas(areas);

  return areas;
};