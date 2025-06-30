import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 py-8">
            <div className="container mx-auto px-4">
                {/* Top Section */}
                <div className="flex flex-col md:flex-row justify-between space-y-8 md:space-y-0">
                    {/* Brand & Description */}
                    <div className="md:w-1/4">
                        <h2 className="text-2xl font-bold text-yellow-500">Bio D Scan</h2>
                        <p className="mt-3 text-gray-400 leading-relaxed">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor. Lorem ipsum dolor sit amet, consectetur.
                        </p>
                        {/* Social Icons (replace with actual icons/links) */}
                        <div className="flex space-x-4 mt-4">
                            <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-yellow-500">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M22.525 0H1.475A1.48 1.48 0 0 0 0 1.475v21.05A1.48 1.48 0 0 0 1.475 24h11.337v-9.294H9.845v-3.63h2.967V8.413c0-2.938 1.793-4.541 4.414-4.541 1.255 0 2.333.093 2.646.135v3.07h-1.816c-1.422 0-1.697.677-1.697 1.669v2.187h3.392l-.442 3.63h-2.95V24h5.783A1.48 1.48 0 0 0 24 22.525V1.475A1.48 1.48 0 0 0 22.525 0z" />
                                </svg>
                            </a>
                            <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-yellow-500">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M24 4.557a9.9 9.9 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724 9.862 9.862 0 0 1-3.127 1.195 4.917 4.917 0 0 0-8.38 4.482A13.949 13.949 0 0 1 1.671 3.149a4.916 4.916 0 0 0 1.523 6.558 4.903 4.903 0 0 1-2.228-.616v.06a4.917 4.917 0 0 0 3.946 4.827 4.935 4.935 0 0 1-2.224.085 4.919 4.919 0 0 0 4.59 3.417A9.868 9.868 0 0 1 0 19.54a13.901 13.901 0 0 0 7.548 2.212c9.057 0 14.01-7.504 14.01-14.009 0-.213-.005-.425-.014-.636A9.993 9.993 0 0 0 24 4.557z" />
                                </svg>
                            </a>
                            <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-yellow-500">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.2 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.4a4.9 4.9 0 0 1 1.8 1.17 4.9 4.9 0 0 1 1.17 1.8c.16.46.346 1.26.4 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.4 2.43a4.9 4.9 0 0 1-1.17 1.8 4.9 4.9 0 0 1-1.8 1.17c-.46.16-1.26.346-2.43.4-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.43-.4a4.9 4.9 0 0 1-1.8-1.17 4.9 4.9 0 0 1-1.17-1.8c-.16-.46-.346-1.26-.4-2.43-.058-1.266-.07-1.65-.07-4.85s.012-3.584.07-4.85c.054-1.17.24-1.97.4-2.43a4.9 4.9 0 0 1 1.17-1.8 4.9 4.9 0 0 1 1.8-1.17c.46-.16 1.26-.346 2.43-.4 1.266-.058 1.65-.07 4.85-.07M12 0C8.74 0 8.332.013 7.053.07 5.77.127 4.66.35 3.76.722 2.8 1.118 2.02 1.69 1.324 2.386.63 3.08.058 3.86-.338 4.82c-.372.9-.595 2.01-.652 3.293C-.013 9.392 0 9.8 0 12s-.013 2.608.07 3.887c.057 1.283.28 2.393.652 3.293.396.96.968 1.74 1.664 2.436.696.696 1.476 1.268 2.436 1.664.9.372 2.01.595 3.293.652C8.608 23.987 9.017 24 12 24s3.392-.013 4.887-.07c1.283-.057 2.393-.28 3.293-.652.96-.396 1.74-.968 2.436-1.664.696-.696 1.268-1.476 1.664-2.436.372-.9.595-2.01.652-3.293.057-1.28.07-1.688.07-4.887s-.013-3.607-.07-4.887c-.057-1.283-.28-2.393-.652-3.293-.396-.96-.968-1.74-1.664-2.436-.696-.696-1.476-1.268-2.436-1.664-.9-.372-2.01-.595-3.293-.652C15.392.013 14.983 0 12 0z" />
                                    <path d="M12 5.838A6.162 6.162 0 1 0 18.162 12 6.164 6.164 0 0 0 12 5.838zm0 10.2A4.038 4.038 0 1 1 16.038 12 4.042 4.042 0 0 1 12 16.038zM18.406 4.594a1.44 1.44 0 1 0 1.44 1.44 1.441 1.441 0 0 0-1.44-1.44z" />
                                </svg>
                            </a>
                            <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-yellow-500">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 20h-3v-11h3v11zm-1.5-12.277c-.966 0-1.75-.79-1.75-1.765 0-.975.784-1.765 1.75-1.765s1.75.79 1.75 1.765c0 .975-.784 1.765-1.75 1.765zm13.5 12.277h-3v-5.604c0-1.336-.027-3.053-1.861-3.053-1.863 0-2.149 1.45-2.149 2.949v5.708h-3v-11h2.888v1.507h.042c.403-.763 1.386-1.566 2.852-1.566 3.051 0 3.614 2.007 3.614 4.615v6.444z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="md:w-1/4">
                        <h3 className="text-lg font-semibold text-white">Quick Links</h3>
                        <ul className="mt-3 space-y-2">
                            <li>
                                <a href="#" className="hover:text-yellow-500">
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-yellow-500">
                                    Our Process
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-yellow-500">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-yellow-500">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Other Pages */}
                    <div className="md:w-1/4">
                        <h3 className="text-lg font-semibold text-white">Other Pages</h3>
                        <ul className="mt-3 space-y-2">
                            <li>
                                <a href="#" className="hover:text-yellow-500">
                                    Privacy &amp; Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-yellow-500">
                                    Terms of Use
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-yellow-500">
                                    Disclaimer
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-yellow-500">
                                    FAQ
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="md:w-1/4">
                        <h3 className="text-lg font-semibold text-white">Contact Info</h3>
                        <ul className="mt-3 space-y-2">
                            <li className="text-gray-400">
                                Jl. Raya Mas Ubud No.88, Gianyar,
                                <br />
                                Bali, Indonesia – 80571
                            </li>
                            <li className="text-gray-400">+62 3451 1634784</li>
                            <li className="text-gray-400">contact@domain.com</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-8 border-t border-gray-700 pt-4 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Madoo. All rights reserved.</p>
                    <p className="text-gray-500 text-sm">Honey &amp; Bee Keeping TemplateKit by Jegtheme</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
