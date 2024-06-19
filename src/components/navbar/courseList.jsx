import {
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

const navigation = [
  { name: 'Dashboard', href: '#', icon: HomeIcon, count: '5', current: true },
  {
    name: 'Team',
    href: '#',
    icon: UsersIcon,
    current: false,
    children: [
      { name: 'Engineering', href: '#' },
      { name: 'Human Resources', href: '#' },
      { name: 'Customer Success', href: '#' },
    ],
  },
  {
    name: 'Projects',
    href: '#',
    icon: FolderIcon,
    count: '12',
    current: false,
    children: [
      { name: 'Engineering', href: '#' },
      { name: 'Human Resources', href: '#' },
      { name: 'Customer Success', href: '#' },
    ],
  },
  {
    name: 'Calendar',
    href: '#',
    icon: CalendarIcon,
    count: '20+',
    current: false,
  },
  { name: 'Documents', href: '#', icon: DocumentDuplicateIcon, current: false },
  { name: 'Reports', href: '#', icon: ChartPieIcon, current: false },
];
const teams = [
  { id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
  { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
  { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function CourseList() {
  return (
    <>
      <div className="flex flex-col fixed gap-y-5 overflow-y-auto max-h-full bg-gray-900 px-6 pt-5">
        <nav className="flex  flex-col">
          <ul role="list" className="gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    {!item.children ? (
                      <a
                        href={item.href}
                        className={classNames(
                          item.current ? 'bg-gray-50' : 'hover:bg-gray-50',
                          'block rounded-md py-2 pl-10 pr-2 text-sm font-semibold leading-6 text-gray-700',
                        )}
                      >
                        {item.name}
                      </a>
                    ) : (
                      <Disclosure as="div">
                        {({ open }) => (
                          <>
                            <DisclosureButton
                              className={classNames(
                                item.current
                                  ? 'bg-gray-50'
                                  : 'hover:bg-gray-50',
                                'flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold leading-6 text-gray-700',
                              )}
                            >
                              <ChevronRightIcon
                                className={classNames(
                                  open
                                    ? 'rotate-90 text-gray-500'
                                    : 'text-gray-400',
                                  'h-5 w-5 shrink-0',
                                )}
                                aria-hidden="true"
                              />
                              {item.name}
                            </DisclosureButton>
                            <DisclosurePanel as="ul" className="mt-1 px-2">
                              {item.children.map((subItem) => (
                                <li key={subItem.name}>
                                  <DisclosureButton
                                    as="a"
                                    href={subItem.href}
                                    className={classNames(
                                      subItem.current
                                        ? 'bg-gray-50'
                                        : 'hover:bg-gray-50',
                                      'block rounded-md py-2 pl-9 pr-2 text-sm leading-6 text-gray-700',
                                    )}
                                  >
                                    {subItem.name}
                                  </DisclosureButton>
                                </li>
                              ))}
                            </DisclosurePanel>
                          </>
                        )}
                      </Disclosure>
                    )}
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400">
                Your teams
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {teams.map((team) => (
                  <li key={team.name}>
                    <a
                      href={team.href}
                      className={classNames(
                        team.current
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                        'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                      )}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                        {team.initial}
                      </span>
                      <span className="truncate">{team.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </li>
            <li className="-mx-6 mt-auto">
              <a
                href="#"
                className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-gray-800"
              >
                <img
                  className="h-8 w-8 rounded-full bg-gray-800"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
                <span className="sr-only">Your profile</span>
                <span aria-hidden="true">Tom Cook</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
