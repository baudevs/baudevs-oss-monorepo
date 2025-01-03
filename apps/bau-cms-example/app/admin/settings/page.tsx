import { Save } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <button className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </button>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                General Settings
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="site-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Site Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="site-name"
                      id="site-name"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      defaultValue="BauCMS Example"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Site Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      defaultValue="An example site built with BauCMS"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Database Settings
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="database-url"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Database URL
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="database-url"
                      id="database-url"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      defaultValue={process.env.DATABASE_URL}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Media Settings
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="upload-dir"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Upload Directory
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="upload-dir"
                      id="upload-dir"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      defaultValue="/uploads"
                    />
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label
                    htmlFor="max-upload-size"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Maximum Upload Size (MB)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="max-upload-size"
                      id="max-upload-size"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      defaultValue={10}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
