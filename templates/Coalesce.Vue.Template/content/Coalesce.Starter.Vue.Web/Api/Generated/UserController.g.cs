
using Coalesce.Starter.Vue.Web.Models;
using IntelliTect.Coalesce;
using IntelliTect.Coalesce.Api;
using IntelliTect.Coalesce.Api.Behaviors;
using IntelliTect.Coalesce.Api.Controllers;
using IntelliTect.Coalesce.Api.DataSources;
using IntelliTect.Coalesce.Mapping;
using IntelliTect.Coalesce.Mapping.IncludeTrees;
using IntelliTect.Coalesce.Models;
using IntelliTect.Coalesce.TypeDefinition;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Coalesce.Starter.Vue.Web.Api
{
    [Route("api/User")]
    [Authorize]
    [ServiceFilter(typeof(IApiActionFilter))]
    public partial class UserController
        : BaseApiController<Coalesce.Starter.Vue.Data.Models.User, UserParameter, UserResponse, Coalesce.Starter.Vue.Data.AppDbContext>
    {
        public UserController(CrudContext<Coalesce.Starter.Vue.Data.AppDbContext> context) : base(context)
        {
            GeneratedForClassViewModel = context.ReflectionRepository.GetClassViewModel<Coalesce.Starter.Vue.Data.Models.User>();
        }

        [HttpGet("get/{id}")]
        [Authorize]
        public virtual Task<ItemResult<UserResponse>> Get(
            string id,
            DataSourceParameters parameters,
            IDataSource<Coalesce.Starter.Vue.Data.Models.User> dataSource)
            => GetImplementation(id, parameters, dataSource);

        [HttpGet("list")]
        [Authorize]
        public virtual Task<ListResult<UserResponse>> List(
            ListParameters parameters,
            IDataSource<Coalesce.Starter.Vue.Data.Models.User> dataSource)
            => ListImplementation(parameters, dataSource);

        [HttpGet("count")]
        [Authorize]
        public virtual Task<ItemResult<int>> Count(
            FilterParameters parameters,
            IDataSource<Coalesce.Starter.Vue.Data.Models.User> dataSource)
            => CountImplementation(parameters, dataSource);

        [HttpPost("save")]
        [Authorize]
        public virtual Task<ItemResult<UserResponse>> Save(
            [FromForm] UserParameter dto,
            [FromQuery] DataSourceParameters parameters,
            IDataSource<Coalesce.Starter.Vue.Data.Models.User> dataSource,
            IBehaviors<Coalesce.Starter.Vue.Data.Models.User> behaviors)
            => SaveImplementation(dto, parameters, dataSource, behaviors);

        [HttpPost("bulkSave")]
        [Authorize]
        public virtual Task<ItemResult<UserResponse>> BulkSave(
            [FromBody] BulkSaveRequest dto,
            [FromQuery] DataSourceParameters parameters,
            IDataSource<Coalesce.Starter.Vue.Data.Models.User> dataSource,
            [FromServices] IDataSourceFactory dataSourceFactory,
            [FromServices] IBehaviorsFactory behaviorsFactory)
            => BulkSaveImplementation(dto, parameters, dataSource, dataSourceFactory, behaviorsFactory);

        // Methods from data class exposed through API Controller.

        /// <summary>
        /// Method: GetPhoto
        /// </summary>
        [HttpGet("GetPhoto")]
        [Authorize]
        public virtual async Task<ActionResult<ItemResult<IntelliTect.Coalesce.Models.IFile>>> GetPhoto(
            [FromServices] IDataSourceFactory dataSourceFactory,
            string id,
            byte[] etag)
        {
            var dataSource = dataSourceFactory.GetDataSource<Coalesce.Starter.Vue.Data.Models.User, Coalesce.Starter.Vue.Data.Models.User>("Default");
            var itemResult = await dataSource.GetItemAsync(id, new DataSourceParameters());
            if (!itemResult.WasSuccessful)
            {
                return new ItemResult<IntelliTect.Coalesce.Models.IFile>(itemResult);
            }
            var item = itemResult.Object;

            var _currentVaryValue = item.PhotoHash;
            if (_currentVaryValue != default)
            {
                var _expectedEtagHeader = new Microsoft.Net.Http.Headers.EntityTagHeaderValue('"' + Microsoft.AspNetCore.WebUtilities.Base64UrlTextEncoder.Encode(_currentVaryValue) + '"');
                var _cacheControlHeader = new Microsoft.Net.Http.Headers.CacheControlHeaderValue { Private = true, MaxAge = TimeSpan.Zero };
                if (etag != default && _currentVaryValue.SequenceEqual(etag))
                {
                    _cacheControlHeader.MaxAge = TimeSpan.FromDays(30);
                }
                Response.GetTypedHeaders().CacheControl = _cacheControlHeader;
                Response.GetTypedHeaders().ETag = _expectedEtagHeader;
                if (Request.GetTypedHeaders().IfNoneMatch.Any(value => value.Compare(_expectedEtagHeader, true)))
                {
                    return StatusCode(StatusCodes.Status304NotModified);
                }
            }

            var _methodResult = item.GetPhoto(
                User,
                Db
            );
            if (_methodResult.Object != null)
            {
                return File(_methodResult.Object);
            }
            var _result = new ItemResult<IntelliTect.Coalesce.Models.IFile>(_methodResult);
            _result.Object = _methodResult.Object;
            return _result;
        }

        /// <summary>
        /// Method: Evict
        /// </summary>
        [HttpPost("Evict")]
        [Authorize(Roles = "UserAdmin")]
        public virtual async Task<ItemResult> Evict(
            [FromServices] IDataSourceFactory dataSourceFactory,
            [FromForm(Name = "id")] string id)
        {
            var dataSource = dataSourceFactory.GetDataSource<Coalesce.Starter.Vue.Data.Models.User, Coalesce.Starter.Vue.Data.Models.User>("Default");
            var itemResult = await dataSource.GetItemAsync(id, new DataSourceParameters());
            if (!itemResult.WasSuccessful)
            {
                return new ItemResult(itemResult);
            }
            var item = itemResult.Object;
            var _methodResult = item.Evict(
                User,
                Db
            );
            var _result = new ItemResult(_methodResult);
            return _result;
        }

        /// <summary>
        /// Method: InviteUser
        /// </summary>
        [HttpPost("InviteUser")]
        [Authorize(Roles = "UserAdmin")]
        public virtual async Task<ItemResult> InviteUser(
            [FromServices] Coalesce.Starter.Vue.Data.Auth.InvitationService invitationService,
            [FromForm(Name = "email")] string email,
            [FromForm(Name = "role")] RoleParameter role)
        {
            var _params = new
            {
                email = email,
                role = !Request.Form.HasAnyValue(nameof(role)) ? null : role
            };

            if (Context.Options.ValidateAttributesForMethods)
            {
                var _validationResult = ItemResult.FromParameterValidation(
                    GeneratedForClassViewModel!.MethodByName("InviteUser"), _params, HttpContext.RequestServices);
                if (!_validationResult.WasSuccessful) return _validationResult;
            }

            var _mappingContext = new MappingContext(Context);
            var _methodResult = await Coalesce.Starter.Vue.Data.Models.User.InviteUser(
                Db,
                invitationService,
                _params.email,
                _params.role?.MapToNew(_mappingContext)
            );
            var _result = new ItemResult(_methodResult);
            return _result;
        }

        /// <summary>
        /// Method: SetEmail
        /// </summary>
        [HttpPost("SetEmail")]
        [Authorize]
        public virtual async Task<ItemResult> SetEmail(
            [FromServices] IDataSourceFactory dataSourceFactory,
            [FromServices] Coalesce.Starter.Vue.Data.Auth.UserManagementService userService,
            [FromForm(Name = "id")] string id,
            [FromForm(Name = "newEmail")] string newEmail)
        {
            var dataSource = dataSourceFactory.GetDataSource<Coalesce.Starter.Vue.Data.Models.User, Coalesce.Starter.Vue.Data.Models.User>("Default");
            var itemResult = await dataSource.GetItemAsync(id, new DataSourceParameters());
            if (!itemResult.WasSuccessful)
            {
                return new ItemResult(itemResult);
            }
            var item = itemResult.Object;
            var _params = new
            {
                newEmail = newEmail
            };

            if (Context.Options.ValidateAttributesForMethods)
            {
                var _validationResult = ItemResult.FromParameterValidation(
                    GeneratedForClassViewModel!.MethodByName("SetEmail"), _params, HttpContext.RequestServices);
                if (!_validationResult.WasSuccessful) return _validationResult;
            }

            var _methodResult = await item.SetEmail(
                userService,
                User,
                _params.newEmail
            );
            var _result = new ItemResult(_methodResult);
            return _result;
        }

        /// <summary>
        /// Method: SendEmailConfirmation
        /// </summary>
        [HttpPost("SendEmailConfirmation")]
        [Authorize]
        public virtual async Task<ItemResult> SendEmailConfirmation(
            [FromServices] IDataSourceFactory dataSourceFactory,
            [FromServices] Coalesce.Starter.Vue.Data.Auth.UserManagementService userService,
            [FromForm(Name = "id")] string id)
        {
            var dataSource = dataSourceFactory.GetDataSource<Coalesce.Starter.Vue.Data.Models.User, Coalesce.Starter.Vue.Data.Models.User>("Default");
            var itemResult = await dataSource.GetItemAsync(id, new DataSourceParameters());
            if (!itemResult.WasSuccessful)
            {
                return new ItemResult(itemResult);
            }
            var item = itemResult.Object;
            var _methodResult = await item.SendEmailConfirmation(
                userService,
                User
            );
            var _result = new ItemResult(_methodResult);
            return _result;
        }

        /// <summary>
        /// Method: SetPassword
        /// </summary>
        [HttpPost("SetPassword")]
        [Authorize]
        public virtual async Task<ItemResult> SetPassword(
            [FromServices] IDataSourceFactory dataSourceFactory,
            [FromServices] Microsoft.AspNetCore.Identity.UserManager<Coalesce.Starter.Vue.Data.Models.User> userManager,
            [FromServices] Microsoft.AspNetCore.Identity.SignInManager<Coalesce.Starter.Vue.Data.Models.User> signInManager,
            [FromForm(Name = "id")] string id,
            [FromForm(Name = "currentPassword")] string currentPassword,
            [FromForm(Name = "newPassword")] string newPassword,
            [FromForm(Name = "confirmNewPassword")] string confirmNewPassword)
        {
            var dataSource = dataSourceFactory.GetDataSource<Coalesce.Starter.Vue.Data.Models.User, Coalesce.Starter.Vue.Data.Models.User>("Default");
            var itemResult = await dataSource.GetItemAsync(id, new DataSourceParameters());
            if (!itemResult.WasSuccessful)
            {
                return new ItemResult(itemResult);
            }
            var item = itemResult.Object;
            var _params = new
            {
                currentPassword = currentPassword,
                newPassword = newPassword,
                confirmNewPassword = confirmNewPassword
            };

            if (Context.Options.ValidateAttributesForMethods)
            {
                var _validationResult = ItemResult.FromParameterValidation(
                    GeneratedForClassViewModel!.MethodByName("SetPassword"), _params, HttpContext.RequestServices);
                if (!_validationResult.WasSuccessful) return _validationResult;
            }

            var _methodResult = await item.SetPassword(
                userManager,
                signInManager,
                User,
                _params.currentPassword,
                _params.newPassword,
                _params.confirmNewPassword
            );
            var _result = new ItemResult(_methodResult);
            return _result;
        }
    }
}
