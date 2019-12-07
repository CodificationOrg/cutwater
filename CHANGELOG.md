# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.5.4](https://github.com/CodificationOrg/cutwater/compare/v0.5.3...v0.5.4) (2019-12-07)


### Bug Fixes

* correct problem with cleaning lib directories ([afa681f](https://github.com/CodificationOrg/cutwater/commit/afa681f))





## [0.5.3](https://github.com/CodificationOrg/cutwater/compare/v0.5.2...v0.5.3) (2019-11-18)


### Bug Fixes

* ensure we create types and sourcemaps ([f00416b](https://github.com/CodificationOrg/cutwater/commit/f00416b))





## [0.5.2](https://github.com/CodificationOrg/cutwater/compare/v0.5.1...v0.5.2) (2019-11-17)


### Bug Fixes

* add missing dependencies to specific packages ([ba28046](https://github.com/CodificationOrg/cutwater/commit/ba28046))





## [0.5.1](https://github.com/CodificationOrg/cutwater/compare/v0.5.0...v0.5.1) (2019-11-17)


### Bug Fixes

* ensure 'includes' file in published ([b9be588](https://github.com/CodificationOrg/cutwater/commit/b9be588))





# 0.5.0 (2019-11-11)


### Bug Fixes

* add fix for 'window' bug in webpack ([7513cc8](https://github.com/CodificationOrg/cutwater/commit/7513cc8))
* add missing export for LoggingEvent ([bd31d7f](https://github.com/CodificationOrg/cutwater/commit/bd31d7f))
* add missing export for new GotUtils class ([9048c52](https://github.com/CodificationOrg/cutwater/commit/9048c52))
* add missing exports ([bf48201](https://github.com/CodificationOrg/cutwater/commit/bf48201))
* add missing space to class declaration ([e25975e](https://github.com/CodificationOrg/cutwater/commit/e25975e))
* add node to types ([af668aa](https://github.com/CodificationOrg/cutwater/commit/af668aa))
* change default offset to be more universal ([8b32740](https://github.com/CodificationOrg/cutwater/commit/8b32740))
* correct bad imports ([701b1b7](https://github.com/CodificationOrg/cutwater/commit/701b1b7))
* correct bad typings entry ([71a450e](https://github.com/CodificationOrg/cutwater/commit/71a450e))
* correct bad typings entry ([001850d](https://github.com/CodificationOrg/cutwater/commit/001850d))
* correct bad typings entry ([fafc449](https://github.com/CodificationOrg/cutwater/commit/fafc449))
* correct bug that prevented version display ([278e1e3](https://github.com/CodificationOrg/cutwater/commit/278e1e3))
* correct empy path element for nix ([2a4599f](https://github.com/CodificationOrg/cutwater/commit/2a4599f))
* correct incorrect error message on exit ([7f223fc](https://github.com/CodificationOrg/cutwater/commit/7f223fc))
* correct issue causing some response Buffers to fail ([24376f6](https://github.com/CodificationOrg/cutwater/commit/24376f6))
* correct missing check for undefined ([3e07170](https://github.com/CodificationOrg/cutwater/commit/3e07170))
* do not return array when header only contains a single value ([29ee677](https://github.com/CodificationOrg/cutwater/commit/29ee677))
* ensure projects build before ci tests ([58c690d](https://github.com/CodificationOrg/cutwater/commit/58c690d))
* fix incorrect return value on toPath ([e583931](https://github.com/CodificationOrg/cutwater/commit/e583931))
* remove extra import ([291a5a1](https://github.com/CodificationOrg/cutwater/commit/291a5a1))
* remove option that crashes prod builds ([1756977](https://github.com/CodificationOrg/cutwater/commit/1756977))
* remove unused import ([516a926](https://github.com/CodificationOrg/cutwater/commit/516a926))
* remove use of follow-redirects package ([3ef5ef8](https://github.com/CodificationOrg/cutwater/commit/3ef5ef8))
* remove useless imports ([92b588c](https://github.com/CodificationOrg/cutwater/commit/92b588c))
* update references to use new cutwater-core ([9ab1ecb](https://github.com/CodificationOrg/cutwater/commit/9ab1ecb))


### Features

* add ability to create missing directories ([715d17c](https://github.com/CodificationOrg/cutwater/commit/715d17c))
* add build support for OpenAPI processing ([6bcc480](https://github.com/CodificationOrg/cutwater/commit/6bcc480))
* add custom origin request headers and config values ([f7b2061](https://github.com/CodificationOrg/cutwater/commit/f7b2061))
* add function to handle custom origins ([f8a0c37](https://github.com/CodificationOrg/cutwater/commit/f8a0c37))
* add HttpUtil for buffering binary responses ([4823e4a](https://github.com/CodificationOrg/cutwater/commit/4823e4a))
* add initial S3 utilities ([4a6f7e1](https://github.com/CodificationOrg/cutwater/commit/4a6f7e1))
* add initial task for handling aws cf deploy ([7932331](https://github.com/CodificationOrg/cutwater/commit/7932331))
* add IOUtils with method to convert Buffers to Streams ([a3fbb07](https://github.com/CodificationOrg/cutwater/commit/a3fbb07))
* add node focused build configuration ([d65765e](https://github.com/CodificationOrg/cutwater/commit/d65765e))
* add option to pass package name ([53b4bce](https://github.com/CodificationOrg/cutwater/commit/53b4bce))
* add support class for working with got ([bb324ef](https://github.com/CodificationOrg/cutwater/commit/bb324ef))
* add support for browser deployed builds ([63fd001](https://github.com/CodificationOrg/cutwater/commit/63fd001))
* add support for Docusaurus conversion ([983419a](https://github.com/CodificationOrg/cutwater/commit/983419a))
* add support for got formatted response bodies ([f6e23a0](https://github.com/CodificationOrg/cutwater/commit/f6e23a0))
* add tasks for linting and testing in ci ([1d2956e](https://github.com/CodificationOrg/cutwater/commit/1d2956e))
* add typescript build support ([2769ad7](https://github.com/CodificationOrg/cutwater/commit/2769ad7))
* add utilities missing from core language for working with strings ([294a653](https://github.com/CodificationOrg/cutwater/commit/294a653))
* add utility method for stream to buffer conversion ([90e32f9](https://github.com/CodificationOrg/cutwater/commit/90e32f9))
* add VarUtils export ([0e14adf](https://github.com/CodificationOrg/cutwater/commit/0e14adf))
* add webpack build support ([c18d880](https://github.com/CodificationOrg/cutwater/commit/c18d880))
* adding proper support for docusaurus ([3bd716e](https://github.com/CodificationOrg/cutwater/commit/3bd716e))
* improve jest task default configuration ([a5621b1](https://github.com/CodificationOrg/cutwater/commit/a5621b1))
* improve usability of api markdown ([ab8bdbc](https://github.com/CodificationOrg/cutwater/commit/ab8bdbc))
* initial import of cutwater-build-core ([0fad8b9](https://github.com/CodificationOrg/cutwater/commit/0fad8b9))
* initial import of docusaurus site config ([6226ba8](https://github.com/CodificationOrg/cutwater/commit/6226ba8))
* remove got related utils ([f0a5899](https://github.com/CodificationOrg/cutwater/commit/f0a5899))
* update default typedoc config ([398f05c](https://github.com/CodificationOrg/cutwater/commit/398f05c))
